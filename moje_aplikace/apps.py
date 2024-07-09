from django.apps import AppConfig

class MojeAplikaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'moje_aplikace'
    verbose_name = 'Toodle'

    # Pokud nemáte signals.py, můžete tuto metodu zcela odstranit nebo zakomentovat
    # def ready(self):
    #     import moje_aplikace.signals  # noqa
