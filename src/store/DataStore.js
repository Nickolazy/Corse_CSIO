  import { defineStore } from 'pinia';
  import { ID, Query } from 'appwrite';
  import { databases } from '../appwrite';

  import axios from 'axios';

  import { Client, Databases, Account, Storage } from 'appwrite';

  const client = new Client();
  client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('66cb7c35000f04176383');

  const storage = new Storage(client);

  export const CSIO_DATABASE_ID = "66d0b46b0010933cfb1c";

  export const COURSES_ID = "66d0b472000897d31516";
  export const WEBINARS_ID = "66d479080017c27da677";

  export const FORMS_ID = "66d1c23c0012197cf2ec";
  export const TYPES_ID = "66d1c3b0002139a82454";
  export const SCHEDULES_ID = "66d1c412003b560bb9a4";

  export const TEACHERS_ID = "66d497b3001d1b318f2a";

  export const NEWS_ID = "66d49a3f001d1e759f66";
  export const EVENTS_ID = "66d49a5f001bbbafdbde";
  export const SALES_ID = "66d49a4a00106f8d5805";

  export const BUCKET_ID = "66d499ff00044379fc90";

  export const useDataStore = defineStore('DataStore', {
    state: () => ({
      Курсы: [],
      ВебинарыСеминары: [],

      Преподаватели: [],
      РасписаниеПреподавателей: [],

      Фото: [],

      Акции: [],
      Новости: [],
      События: [],
    }),

    actions: {
      async fetchCourses() {
        try {
          const response = await axios.get('http://localhost:3000/api/courses');
          this.Курсы = response.data;
        } catch (error) {
          console.error('Ошибка при получении курсов:', error);
        }
      },
      
      async addCourse(course) {
        try {
          const response = await axios.post('http://localhost:3000/api/courses', course);
          // Убедитесь, что мы возвращаем весь объект, а не только id
          course.id = response.data.id;
          await this.fetchCourses();
      
          return response.data;  // возвращаем весь объект, включая id
        } catch (error) {
          console.error('Ошибка при добавлении курса:', error);
          throw error;  // важно выбрасывать ошибку для обработки в catch блока
        }
      },
      
      
      async updateCourse(id, updatedCourse) {
        console.log(id, updatedCourse)
        try {
          await axios.put(`http://localhost:3000/api/courses/${id}`, updatedCourse);
          await this.fetchCourses();  // Обновляем список курсов
        } catch (error) {
          console.error('Ошибка при обновлении курса:', error);
        }
      },
    

    async handleCourseUpdated(updatedCourse) {
      try {
        // Проверка на наличие id
        if (!updatedCourse || !updatedCourse.id) {
          return;
        }
    
        // Логика обновления курса на сервере
        const response = await axios.put(`http://localhost:3000/api/courses/${updatedCourse.id}`, updatedCourse);
    
        // Обновление курса в локальном состоянии
        const index = this.courses.findIndex(course => course.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        } else {
          throw new Error('Курс не найден в локальном состоянии');
        }
      } catch (error) {
        console.error('Ошибка при обновлении курса:', error);
      }
    },
      
      
    async handleWebinarUpdated(updatedWebinar) {
      try {
        // Проверка на наличие id
        if (!updatedWebinar || !updatedWebinar.id) {
          return;
        }
    
        // Логика обновления вебинара на сервере
        const response = await axios.put(`http://localhost:3000/api/courses/${updatedWebinar.id}`, updatedWebinar);
    
        // Обновление вебинара в локальном состоянии
        const index = this.courses.findIndex(course => course.id === updatedWebinar.id);
        if (index !== -1) {
          this.courses[index] = updatedWebinar;
        } else {
          throw new Error('Вебинар не найден в локальном состоянии');
        }
      } catch (error) {
        console.error('Ошибка при обновлении вебинара:', error);
      }
    },
    
    
    async deleteCourse(id) {
      try {
        await axios.delete(`http://localhost:3000/api/courses/${id}`);
        await this.fetchCourses();
      } catch (error) {
        console.error('Ошибка при удалении курса:', error);
      }
    },
    
    // ???
    async deleteFormsByCourseTitle(title) {
      try {
        console.log('Fetching forms with title:', title);
        const result = await client.query(
          'SELECT * FROM forms WHERE title = $1 AND category = $2',
          [title, 'course']
        );
    
        console.log('Forms to delete:', result.rows);
    
        // Удаляем каждую найденную форму
        for (const form of result.rows) {
          console.log('Deleting form with ID:', form.id);
          await client.query('DELETE FROM forms WHERE id = $1', [form.id]);
        }
      } catch (error) {
        console.error('Ошибка при удалении форм обучения:', error);
      }
    },

    // ???
    async deleteTypesByCourseTitle(title) {
      try {
        console.log('Fetching types with course title:', title);
        const result = await client.query(
          'SELECT * FROM types WHERE title = $1',
          [title]
        );
    
        console.log('Types to delete:', result.rows);
    
        // Удаляем каждый найденный тип
        for (const type of result.rows) {
          console.log('Deleting type with ID:', type.id);
          await client.query('DELETE FROM types WHERE id = $1', [type.id]);
        }
      } catch (error) {
        console.error('Ошибка при удалении типов обучения:', error);
      }
    },

    // ???
    async deleteSchedulesByCourseTitle(title) {
      try {
        console.log('Fetching schedules with title:', title);
        const result = await client.query(
          'SELECT * FROM schedules WHERE title = $1',
          [title]
        );
    
        console.log('Schedules to delete:', result.rows);
    
        // Удаляем каждое найденное расписание
        for (const schedule of result.rows) {
          console.log('Deleting schedule with ID:', schedule.id);
          await client.query('DELETE FROM schedules WHERE id = $1', [schedule.id]);
        }
      } catch (error) {
        console.error('Ошибка при удалении расписания:', error);
      }
    },

    async deleteType(typeId) {
      try {
        await axios.delete(`http://localhost:3000/api/type/${typeId}`);
        console.log('Тип успешно удален');
      } catch (error) {
        console.error('Ошибка при удалении типа:', error);
      }
    },
    
    async deleteForm(formId) {
      try {
        await axios.delete(`http://localhost:3000/api/form/${formId}`);
        console.log('Форма успешно удалена');
      } catch (error) {
        console.error('Ошибка при удалении формы:', error);
      }
    },
    
    async deleteShedule(schId) {
      try {
        await axios.delete(`http://localhost:3000/api/shedule/${schId}`);
        console.log('Расписание успешно удалено');
      } catch (error) {
        console.error('Ошибка при удалении расписания:', error);
      }
    },

    async fetchTypesByCourse(title) {
      try {
        const response = await axios.get('http://localhost:3000/api/types', {
          params: { 
            title, 
            category: 'course'
          }
        });
        console.log('Fetched types for course:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении типов по курсу:', error);
      }
    },

    async fetchFormsByCourse(title) {
      try {
        const response = await axios.get('http://localhost:3000/api/forms', {
          params: { 
            title, 
            category: 'course'
          }
        });
        console.log('Fetched forms for course:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении форм по курсу:', error);
      }
    },

    async fetchShedulesByCourse(title) {
      try {
        const response = await axios.get('http://localhost:3000/api/shedules', {
          params: { 
            title, 
            category: 'course'
          }
        });
        console.log('Fetched shedules for course:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении расписаний по курсу:', error);
      }
    },
    

    async fetchFormsByWebinar(title, isWebinar) {
      try {
        // Получаем формы, связанные с вебинаром
        const response = await axios.get('http://localhost:3000/api/forms', {
          params: { 
            title, 
            category: 'webinar'
          }
        });
        
        console.log('Fetched forms for webinar:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении форм по вебинару:', error);
      }
    },
    
    async fetchTypesByWebinar(title, isWebinar) {
      try {
        // Получаем формы, связанные с вебинаром
        const response = await axios.get('http://localhost:3000/api/types', {
          params: { 
            title, 
            category: 'webinar',
          }
        });
        
        console.log('Fetched types for webinar:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении типов по вебинару:', error);
      }
    },
    
    async fetchShedulesByWebinar(title, isWebinar) {
      try {
        const response = await axios.get('http://localhost:3000/api/shedules', {
          params: { 
            title, 
            category: 'webinar'
          }
        });
        
        console.log('Fetched shedules for webinar:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении расписания по вебинару:', error);
      }
    },

    async fetchTeachersByWebinar(teacher) {
      try {
        // Если teacher не определен или пуст, запрос может не работать корректно
        if (!teacher) {
          console.error('Teacher name is required!');
          return;
        }
        
        const response = await axios.get('http://localhost:3000/api/teachers', {
          params: { 
            name: teacher // Передаем параметр name
          }
        });
    
        console.log('Fetched teachers for webinar:', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении преподавателей вебинара:', error);
      }
    },
        
    
    // Добавляем форму обучения
    async addFormOfCourse(form) {
      try {
        console.log(form);
        const response = await axios.post('http://localhost:3000/api/forms', form);
        console.log('Форма обучения успешно добавлена:', response.data);
      } catch (error) {
        console.error('Ошибка при добавлении формы обучения:', error);
      }
    },
    

    // Добавляем тип обучения
    async addTypeOfCourse(type) {
      try {
        const response = await axios.post('http://localhost:3000/api/types', type);
        console.log('Тип обучения успешно добавлен:', response.data);
      } catch (error) {
        console.error('Ошибка при добавлении типа обучения:', error);
      }
    },
    

    // Добавляем расписание
    async addSchedule(schedule) {
      try {
        const response = await axios.post('http://localhost:3000/api/shedules', schedule); // Исправленный URL
        console.log('Расписание обучения успешно добавлено:', response.data);
      } catch (error) {
        console.error('Ошибка при добавлении расписания обучения:', error);
      }
    },

      async fetchShedulesOfTeacher(teacherName) {
        try {
          const response = await axios.get('http://localhost:3000/api/shedulesForTeachers', {
            params: { teacher: teacherName }
          });
      
          console.log('Fetched schedules for teacher:', response.data);
      
          this.РасписаниеПреподавателей = response.data;
      
          return response.data;
        } catch (error) {
          console.error('Ошибка при получении расписания для преподавателя:', error);
          return [];
        }
      },
    
    // Обновляем форму обучения
    async updateFormOfCourse(id, updatedForm) {
      try {
        const response = await axios.put(`http://localhost:3000/api/forms/${id}`, updatedForm);
        
        console.log('Форма успешно обновлено:', response.data);
      } catch (error) {
        console.error('Ошибка при обновлении формы:', error);
      }
    },

    // Обновляем расписание
    async updateSheduleOfCourse(id, updatedSchedule) {
      try {
        const response = await axios.put(`http://localhost:3000/api/shedules/${id}`, updatedSchedule);
        
        console.log('Расписание успешно обновлено:', response.data);
      } catch (error) {
        console.error('Ошибка при обновлении расписания:', error);
      }
    },

    // Обновляем тип обучения
    async updateTypeOfCourse(id, updatedType) {
      try {
        const response = await axios.put(`http://localhost:3000/api/types/${id}`, updatedType);
        
        console.log('Тип успешно обновлено:', response.data);
      } catch (error) {
        console.error('Ошибка при обновлении типа:', error);
      }
    },

    // ???
    // Удаляем форму обучения
    async deleteFormOfCourse(id) {
      try {
        await databases.deleteDocument(CSIO_DATABASE_ID, FORMS_ID, id);
      } catch (error) {
        console.error('Ошибка при удалении формы обучения:', error);
      }
    },

    // ???
    // Удаляем тип обучения
    async deleteTypeOfCourse(id) {
      try {
        await databases.deleteDocument(CSIO_DATABASE_ID, TYPES_ID, id);
      } catch (error) {
        console.error('Ошибка при удалении типа обучения:', error);
      }
    },

    async fetchWebinars() {
      try {
        const response = await axios.get('http://localhost:3000/api/webinars');
        this.ВебинарыСеминары = response.data;
      } catch (error) {
        console.error('Ошибка при получении вебинаров:', error);
      }
    },
    
    async addWebinar(webinar) {
      try {
        const response = await axios.post('http://localhost:3000/api/webinars', webinar);
        webinar.id = response.data.id;  // Присваиваем добавленному вебинару ID
        
        // Обновляем список вебинаров
        await this.fetchWebinars();

        return response.data;
      } catch (error) {
        console.error('Ошибка при добавлении вебинара:', error);
      }
    },
    
    async updateWebinar(id, updatedWebinar) {
      try {
        await axios.put(`http://localhost:3000/api/webinars/${id}`, updatedWebinar);
        await this.fetchWebinars();  // Обновляем список вебинаров
      } catch (error) {
        console.error('Ошибка при обновлении вебинара:', error);
      }
    },
    
    async deleteWebinar(id) {
      try {
        await axios.delete(`http://localhost:3000/api/webinars/${id}`);
        await this.fetchWebinars();
      } catch (error) {
        console.error('Ошибка при удалении вебинара:', error);
      }
    },
    
    async fetchTeachers() {
      try {
        const response = await axios.get('http://localhost:3000/api/teachers');
        this.Преподаватели = response.data;
      } catch (error) {
        console.error('Ошибка при получении преподавателей:', error);
      }
    },
    
    async addTeacher(teacher) {
      try {
        const response = await axios.post('http://localhost:3000/api/teachers', teacher);
        teacher.id = response.data.id;
        
        await this.fetchTeachers();
      } catch (error) {
        console.error('Ошибка при добавлении преподавателя:', error);
      }
    },
    
    async updateTeacher(id, updatedTeacher) {
      try {
        await axios.put(`http://localhost:3000/api/teachers/${id}`, updatedTeacher);
        await this.fetchTeachers(); 
      } catch (error) {
        console.error('Ошибка при обновлении преподавателя:', error);
      }
    },
    
    async deleteTeacher(id) {
      try {
        const response = await axios.delete(`http://localhost:3000/api/teachers/${id}`);
       
        // Обновляем список преподавателей
        await this.fetchTeachers();
      } catch (error) {
        console.error('Ошибка при удалении преподавателя:', error);
      }
    },
    
      
      async uploadAndLinkImage(teacherId, imageFile) {
        try {
          const imageId = await uploadImage(imageFile);
          const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${imageId}/view?project=66cb7c35000f04176383&mode=admin`;
  
          // Обновляем документ преподавателя с URL изображения
          await this.updateTeacher(teacherId, { photoUrl: imageUrl });
        } catch (error) {
          console.error('Ошибка при загрузке и привязке изображения:', error);
        }
      },

      async uploadImage(imageFile) {
        try {
          const result = await storage.createFile(BUCKET_ID, 'unique()', imageFile);
          console.log(result);
        } catch (error) {
          console.error('Ошибка при загрузке изображения:', error);
          throw error;
        }
      },
  
      async getImageUrl(fileId) {
        return `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=66cb7c35000f04176383&project=66cb7c35000f04176383&mode=admin`;
      },
  
      // Получение всех изображений и их сохранение в state
      async fetchAllImages() {
        try {
          const response = await storage.listFiles(BUCKET_ID);
  
          this.Фото = response.files.map(file => ({
            name: file.name,
            url: this.getImageUrl(file.$id),
          }));
  
          console.log('Fetched images:', this.Фото);
        } catch (error) {
          console.error('Ошибка при получении изображений:', error);
        }
      },

      async fetchNews() {
        try {
          const response = await axios.get('http://localhost:3000/api/news');
          this.Новости = response.data;
        } catch (error) {
          console.error('Ошибка при получении новостей:', error);
        }
      },

      async fetchEvents() {
        try {
          const response = await axios.get('http://localhost:3000/api/events');
          this.События = response.data;
        } catch (error) {
          console.error('Ошибка при получении событий:', error);
        }
      },

      async fetchSales() {
        try {
          const response = await axios.get('http://localhost:3000/api/sales');
          this.Акции = response.data;
        } catch (error) {
          console.error('Ошибка при получении акций:', error);
        }
      },

      async deleteSale(id) {
        try {
          const response = await axios.delete(`http://localhost:3000/api/sales/${id}`);
          await this.fetchSales();
        } catch (error) {
          console.error('Ошибка при удалении акции:', error);
        }
      },
      
      async deleteNew(id) {
        try {
          const response = await axios.delete(`http://localhost:3000/api/news/${id}`);
          await this.fetchNews();
        } catch (error) {
          console.error('Ошибка при удалении новости:', error);
        }
      },
      
      async deleteEvent(id) {
        try {
          const response = await axios.delete(`http://localhost:3000/api/events/${id}`);
          await this.fetchEvents();
        } catch (error) {
          console.error('Ошибка при удалении события:', error);
        }
      },
      
      async addSale(sale) {
        try {
          const response = await axios.post('http://localhost:3000/api/sales', sale);
          sale.id = response.data.id;
          
          await this.fetchSales();
        } catch (error) {
          console.error('Ошибка при добавлении преподавателя:', error);
        }
      },
      
      async addNew(news) {
        try {
          const response = await axios.post('http://localhost:3000/api/news', news);
          news.id = response.data.id;
          
          await this.fetchNews();
        } catch (error) {
          console.error('Ошибка при добавлении преподавателя:', error);
        }
      },
      
      async addEvent(event) {
        try {
          const response = await axios.post('http://localhost:3000/api/events', event);
          event.id = response.data.id;
          
          await this.fetchEvents();
        } catch (error) {
          console.error('Ошибка при добавлении преподавателя:', error);
        }
      },

    async updateEvent(id, updatedData, type) {
      try {
        if(type === 'event') {
          await axios.put(`http://localhost:3000/api/events/${id}`, updatedData);
          await this.fetchEvents(); 
        } else if(type === 'sale') {
          await axios.put(`http://localhost:3000/api/sales/${id}`, updatedData);
          await this.fetchSales(); 
          
        } else if(type === 'news') {
          await axios.put(`http://localhost:3000/api/news/${id}`, updatedData);
          await this.fetchNews(); 
        }
      } catch (error) {
        console.error('Ошибка при обновлении событий/акций/новостей:', error);
      }
    }
  },
});
