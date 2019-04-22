from django.contrib import admin

from .models import Plan, Element


# admin.site.register(Plan)
# admin.site.register(Element)


# Register the Admin classes for Book using the decorator
@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('title',)


# Register the Admin classes for Book using the decorator
@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ('plan', 'x0', 'y0', 'x1', 'y1')
