<template >
  <div class="sidebar-drop-wrapper">
        <section class="sidebar-drop news-events-drop">
            <h2 class="sidebar-drop-title news-events-drop-title">
              {{ n.title }}  
            </h2>

            <div class="news-events-drop-content">
                <p>
                  {{ n.content }}  
                </p>
            </div>

            <div class="news-events-drop-socials">
                <div class="news-events-drop-socials-title">
                    <p>
                        Поделиться в соц. сетях
                    </p>
                </div>
                <ul class="news-events-drop-socials-list">
                    <li class="news-events-drop-socials-item">
                        <a href="https://vk.com/csio_dpo" class="news-events-drop-socials-link" target="_blank">
                            <img
                                src="../../assets/img/social-networks/vk-logo-icon.svg"
                                alt="VK"
                                class="news-events-drop-socials-link-image"
                                width="40"
                                height="40"
                                loading="lazy"
                            >
                        </a>
                    </li>

                    <li class="news-events-drop-socials-item">
                        <a href="https://t.me/csiodpo"class="news-events-drop-socials-link" target="_blank">
                            <img
                                src="../../assets/img/social-networks/telegram-logo-icon.svg"
                                alt="Telegram"
                                class="news-events-drop-socials-link-image"
                                width="40"
                                height="40"
                                loading="lazy"
                            >
                        </a>
                    </li>
    
                    <li class="news-events-drop-socials-item">
                        <a href="https://ok.ru/group/70000006090207" class="news-events-drop-socials-link" target="_blank">
                            <img
                                src="../../assets/img/social-networks/ok-logo-icon.svg"
                                alt="OK"
                                class="news-events-drop-socials-link-image"
                                width="40"
                                height="40"
                                loading="lazy"
                            >
                        </a>
                    </li>
    
                    <li class="news-events-drop-socials-item">
                        <a href="https://my.mail.ru/community/csio_dpo/" class="news-events-drop-socials-link" target="_blank">
                            <img
                                src="../../assets/img/social-networks/mail-ru-logo-icon.svg"
                                alt="Mail.ru"
                                class="news-events-drop-socials-link-image"
                                width="40"
                                height="40"
                                loading="lazy"
                            >
                        </a>
                    </li>
                </ul>
            </div>

            <button @click="closeNews" type="button" class="button close-button sidebar-drop-close-button">
                <svg viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 26L26 1" stroke="black"/>
                    <path d="M26 26L0.999999 1" stroke="black"/>
                </svg>
            </button>
        </section>
    </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue';
  import { onMounted, onUnmounted } from 'vue';

  const props = defineProps({
    n: {
      type: Object,
      required: true
    }
  });

  onMounted(() => {
    document.body.classList.add('no-scroll');

  });

  onUnmounted(() => {
    document.body.classList.remove('no-scroll');
  });

  const emit = defineEmits(['close'])

  const closeNews = () => {
    emit('close')
  }


</script>

<style scoped>
  
</style>