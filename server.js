import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Client } = pkg;

const app = express();
const port = 3000;

// Настройка CORS
app.use(cors());
app.use(express.json()); // Для парсинга JSON в теле запросов

// Настройка подключения к PostgreSQL
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123',
  database: 'csio_db',
});

client.connect()
  .then(() => console.log('Подключение к PostgreSQL установлено'))
  .catch((err) => {
    console.error('Ошибка подключения к PostgreSQL:', err);
    process.exit(1); // Завершает процесс, если подключение не удалось
  });

// Эндпоинты для работы с курсами
app.get('/api/courses', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Courses');
    res.json(result.rows); // Отправляем полученные данные в формате JSON
  } catch (error) {
    console.error('Ошибка при получении курсов:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const { title, description, level, direction, stages, grantingrights, qualification } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Courses (title, description, level, direction, stages, grantingrights, qualification) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, level, direction, stages, grantingrights, qualification]
    );
    res.json(result.rows[0]); // Отправляем добавленный курс
  } catch (error) {
    console.error('Ошибка при добавлении курса:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  const { id } = req.params; // Получаем id из параметров URL
  const { title, description, level, direction, stages, grantingrights, qualification } = req.body;
  
  try {
    // Обновляем данные курса в базе
    const result = await client.query(
      'UPDATE Courses SET title = $1, description = $2, level = $3, direction = $4, stages = $5, grantingrights = $6, qualification = $7 WHERE id = $8 RETURNING *',
      [title, description, level, direction, stages, grantingrights, qualification, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json(result.rows[0]); // Отправляем обновлённый курс
  } catch (error) {
    console.error('Ошибка при обновлении курса:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Удаляем курс из базы
    const result = await client.query('DELETE FROM Courses WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json({ message: 'Курс удалён успешно' });
    console.log("Курс удалён успешно");
  } catch (error) {
    console.error('Ошибка при удалении курса:', error);
    res.status(500).json({ error: error.message });
  }
});


// Эндпоинты для работы с вебинарами
app.get('/api/webinars', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Webinars');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении вебинаров:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webinars', async (req, res) => {
  const { title, description, direction, stages, isWebinar, teacherName, teacherDescription } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Webinars (title, description, direction, stages, isWebinar, teacherName, teacherDescription) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, direction, stages, isWebinar, teacherName, teacherDescription]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении вебинара:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/webinars/:id', async (req, res) => {
  const { id } = req.params; // Получаем id из параметров URL
  const { title, description, direction, stages, isWebinar, teacherName, teacherdescription } = req.body;
  
  try {
    // Обновляем данные курса в базе
    const result = await client.query(
      'UPDATE Webinars SET title = $1, description = $2, direction = $3, stages = $4, isWebinar = $5, teacherName = $6, teacherdescription = $7 WHERE id = $8 RETURNING *',
      [title, description, direction, stages, isWebinar, teacherName, teacherdescription, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Вебинар не найден' });
    }

    res.json(result.rows[0]); // Отправляем обновлённый курс
  } catch (error) {
    console.error('Ошибка при обновлении вебинара:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/webinars/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await client.query('DELETE FROM Webinars WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Вебинар не найден' });
    }

    res.json({ message: 'Вебинар удалён успешно' });
    console.log("Вебинар удалён успешно");
  } catch (error) {
    console.error('Ошибка при удалении вебинара:', error);
    res.status(500).json({ error: error.message });
  }
});

// Эндпоинты для работы с формами
app.get('/api/forms', async (req, res) => {
  const { title, category } = req.query;

  try {
    let idQuery;
    let params;

    // Найдем id курса или вебинара по title
    if (category === 'course') {
      idQuery = 'SELECT id FROM Courses WHERE title = $1';
      params = [title];
    } else if (category === 'webinar') {
      // Проверяем isWebinar, чтобы различить вебинар и семинар
      idQuery = 'SELECT id FROM Webinars WHERE title = $1';
      params = [title];
    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await client.query(idQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `${category} not found` });
    }

    const entityId = result.rows[0].id;

    // Теперь выберем формы, соответствующие найденному id
    const formsQuery = 'SELECT * FROM Forms WHERE category = $1 AND ' + 
                        (category === 'course' ? 'course_id' : 'webinar_id') + ' = $2';

    const formsResult = await client.query(formsQuery, [category, entityId]);

    res.json(formsResult.rows);
  } catch (error) {
    console.error('Ошибка при получении форм:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/forms', async (req, res) => {
  const { category, cost, form, hours, length, course_id, webinar_id } = req.body;
  try {
    // Проверим, что категория либо 'course', либо 'webinar'
    if (category !== 'course' && category !== 'webinar') {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Вставляем форму в соответствующую таблицу
    const result = await client.query(
      'INSERT INTO Forms (category, form, hours, length, cost, course_id, webinar_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [category, form, hours, length, cost, course_id, webinar_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении формы:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/forms/:id', async (req, res) => {
  const { id } = req.params;
  const { category, cost, form, hours, length, course_id, webinar_id } = req.body;
  
  try {
    const result = await client.query(
      'UPDATE forms SET category = $1, cost = $2, form = $3, hours = $4, length = $5, course_id = $6, webinar_id = $7 WHERE id = $8 RETURNING *',
      [category, cost, form, hours, length, course_id, webinar_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Форма не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении формы:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/type/:id', async (req, res) => {
  const typeId = req.params.id;

  try {
    // Выполняем запрос на удаление из таблицы types по id
    await client.query('DELETE FROM types WHERE id = $1', [typeId]);

    res.send('Тип успешно удален');
  } catch (error) {
    console.error('Ошибка при удалении типа:', error);
    res.status(500).send('Ошибка при удалении типа');
  }
});


// Эндпоинты для работы с типами
app.get('/api/types', async (req, res) => {
  const { title, category, isWebinar } = req.query;

  try {
    let idQuery;
    let params;

    // Найдем id курса или вебинара по title
    if (category === 'course') {
      idQuery = 'SELECT id FROM Courses WHERE title = $1';
      params = [title];
    } else if (category === 'webinar') {
      // Проверяем isWebinar, чтобы различить вебинар и семинар
      idQuery = 'SELECT id FROM Webinars WHERE title = $1';
      params = [title];
    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await client.query(idQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `${category} not found` });
    }

    const entityId = result.rows[0].id;

    // Теперь выберем типы, соответствующие найденному id
    const typesQuery = 'SELECT * FROM Types WHERE category = $1 AND ' + 
                        (category === 'course' ? 'course_id' : 'webinar_id') + ' = $2';

    const typesResult = await client.query(typesQuery, [category, entityId]);
    res.json(typesResult.rows);
  } catch (error) {
    console.error('Ошибка при получении типов:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/types', async (req, res) => {
  const { category, form, hours, length, type, cost, individualhours, grouphours, course_id, webinar_id } = req.body;
  try {
    // Проверим, что категория либо 'course', либо 'webinar'
    if (category !== 'course' && category !== 'webinar') {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Вставляем тип в соответствующую таблицу
    const result = await client.query(
      'INSERT INTO Types (category, form, hours, length, type, cost, individualhours, grouphours, course_id, webinar_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [category, form, hours, length, type, cost, individualhours, grouphours, course_id, webinar_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении типа:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/types/:id', async (req, res) => {
  const { id } = req.params;
  const { category, form, hours, length, type, cost, individualhours, grouphours, course_id, webinar_id } = req.body;
  
  try {
    const result = await client.query(
      'UPDATE types SET category = $1, form = $2, hours = $3, length = $4, type = $5, cost = $6, individualhours = $7, grouphours = $8, course_id = $9, webinar_id = $10 WHERE id = $11 RETURNING *',
      [category, form, hours, length, type, cost, individualhours, grouphours, course_id, webinar_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тип не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении типа:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/form/:id', async (req, res) => {
  const formId = req.params.id;

  try {
    // Выполняем запрос на удаление из таблицы forms по id
    await client.query('DELETE FROM forms WHERE id = $1', [formId]);

    res.send('Форма успешно удалена');
  } catch (error) {
    console.error('Ошибка при удалении формы:', error);
    res.status(500).send('Ошибка при удалении формы');
  }
});


// Эндпоинты для работы с преподавателями
app.get('/api/teachers', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Teachers');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении преподавателей:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  const { name, description, post, totalworkexp, localworkexp, skills } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Teachers (name, description, post, totalworkexp, localworkexp, skills) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, post, totalworkexp, localworkexp, skills]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении курса:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, post, totalworkexp, localworkexp, skills } = req.body;
  
  try {
    // Обновляем данные курса в базе
    const result = await client.query(
      'UPDATE Teachers SET name = $1, description = $2, post = $3, totalworkexp = $4, localworkexp = $5, skills = $6 WHERE id = $7 RETURNING *',
      [name, description, post, totalworkexp, localworkexp, skills, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Препод не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении препода:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Удаляем курс из базы
    const result = await client.query('DELETE FROM Teachers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Препод не найден' });
    }

    res.json({ message: 'Препод удалён успешно' });
    console.log("Препод удалён успешно");
  } catch (error) {
    console.error('Ошибка при удалении препода:', error);
    res.status(500).json({ error: error.message });
  }
});

// Эндпоинты для работы с расписаниями
app.get('/api/shedules', async (req, res) => {
  const { title, category, isWebinar } = req.query;

  try {
    let idQuery;
    let params;

    // Найдем id курса или вебинара по title
    if (category === 'course') {
      idQuery = 'SELECT id FROM Courses WHERE title = $1';
      params = [title];
    } else if (category === 'webinar') {
      // Проверяем isWebinar, чтобы различить вебинар и семинар
      idQuery = 'SELECT id FROM Webinars WHERE title = $1';
      params = [title];
    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await client.query(idQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `${category} not found` });
    }

    const entityId = result.rows[0].id;

    // Теперь выберем расписания, соответствующие найденному id
    const shedulesQuery = 'SELECT * FROM Shedules WHERE category = $1 AND ' + 
                          (category === 'course' ? 'course_id' : 'webinar_id') + ' = $2';

    const shedulesResult = await client.query(shedulesQuery, [category, entityId]);

    res.json(shedulesResult.rows);
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    res.status(500).json({ error: error.message });
  }
});

// Новый эндпоинт для получения расписания для преподавателей
app.get('/api/shedulesForTeachers', async (req, res) => {
  const { teacher } = req.query; // Получаем имя преподавателя из параметров запроса

  try {
    if (!teacher) {
      return res.status(400).json({ error: 'Teacher name is required' });
    }

    // Ищем расписание для преподавателя по его имени
    const shedulesQuery = `
      SELECT * FROM Shedules 
      WHERE teachers = $1
    `;
    
    const result = await client.query(shedulesQuery, [teacher]);

    if (result.rows.length === 0) {
      return res.status(404);
    }

    // Отправляем расписание
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении расписания для преподавателя:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/shedules', async (req, res) => {
  const { category, form, type, startdate, numofclasses, time, location, teachers, course_id, webinar_id } = req.body;
  try {
    // Проверим, что категория либо 'course', либо 'webinar'
    if (category !== 'course' && category !== 'webinar') {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Вставляем расписание в соответствующую таблицу
    const result = await client.query(
      'INSERT INTO Shedules (category, form, type, startdate, numofclasses, time, location, teachers, course_id, webinar_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [category, form, type, startdate, numofclasses, time, location, teachers, course_id, webinar_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении расписания:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/shedules/:id', async (req, res) => {
  const { id } = req.params;
  const { category, form, type, startdate, numofclasses, time, location, teachers, course_id, webinar_id } = req.body;
  
  try {
    // Обновляем данные расписания в базе данных
    const result = await client.query(
      'UPDATE shedules SET category = $1, form = $2, type = $3, startdate = $4, numofclasses = $5, time = $6, location = $7, teachers = $8, course_id = $9,webinar_id = $10 WHERE id = $11 RETURNING *',
      [category, form, type, startdate, numofclasses, time, location, teachers, course_id, webinar_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Расписание не найдено' });
    }

    // Отправляем обновленное расписание
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении расписания:', error);
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/shedule/:id', async (req, res) => {
  console.log('Путь с параметром id:', req.params.id); // Логируем полученный id
  const schId = req.params.id;

  try {
    await client.query('DELETE FROM shedules WHERE id = $1', [schId]);
    res.send('Расписание успешно удалено');
  } catch (error) {
    console.error('Ошибка при удалении расписания:', error);
    res.status(500).send('Ошибка при удалении расписания');
  }
});


// Эндпоинты для работы с новостями
app.get('/api/news', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM News');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении новостей:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news', async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO News (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении новости:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление новости
app.put('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await client.query(
      'UPDATE News SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'News not found' });
    }
  } catch (error) {
    console.error('Ошибка при обновлении новости:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление новости
app.delete('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM News WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'News deleted successfully' });
    } else {
      res.status(404).json({ error: 'News not found' });
    }
  } catch (error) {
    console.error('Ошибка при удалении новости:', error);
    res.status(500).json({ error: error.message });
  }
});


// Эндпоинты для работы с продажами
app.get('/api/sales', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Sales');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении продаж:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { title, content, dates } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Sales (title, content, dates) VALUES ($1, $2, $3) RETURNING *',
      [title, content, dates]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении продажи:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление продажи
app.put('/api/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, dates } = req.body;
  try {
    const result = await client.query(
      'UPDATE Sales SET title = $1, content = $2, dates = $3 WHERE id = $4 RETURNING *',
      [title, content, dates, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Sale not found' });
    }
  } catch (error) {
    console.error('Ошибка при обновлении продажи:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление продажи
app.delete('/api/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM Sales WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Sale deleted successfully' });
    } else {
      res.status(404).json({ error: 'Sale not found' });
    }
  } catch (error) {
    console.error('Ошибка при удалении продажи:', error);
    res.status(500).json({ error: error.message });
  }
});


// Эндпоинты для работы с событиями
app.get('/api/events', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Events');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении событий:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  const { title, content, dates } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Events (title, content, dates) VALUES ($1, $2, $3) RETURNING *',
      [title, content, dates]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении события:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление события
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, dates } = req.body;
  try {
    const result = await client.query(
      'UPDATE Events SET title = $1, content = $2, dates = $3 WHERE id = $4 RETURNING *',
      [title, content, dates, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error('Ошибка при обновлении события:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление события
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM Events WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Event deleted successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error('Ошибка при удалении события:', error);
    res.status(500).json({ error: error.message });
  }
});


// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
