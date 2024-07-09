from django.contrib import admin
from .models import Text

@admin.register(Text)
class TextAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'hashtags', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('content', 'hashtags')
    readonly_fields = ('created_at',)

    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('user',)
        return self.readonly_fields