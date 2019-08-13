from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('plans/', views.PlanListView.as_view(), name='plans'),
    path('plan/<int:pk>', views.PlanDetailView.as_view(), name='plan-detail'),

]

# Create, delete and update plans
urlpatterns += [
    path('plan/create/', views.PlanCreate.as_view(), name='plan_create'),
    path('plan/<int:pk>/delete/', views.PlanDelete.as_view(), name='plan_delete'),

]

# Edit scheme
urlpatterns += [
    path('plan/<int:pk>/edit_scheme/', views.edit_scheme,
         name='edit-scheme'),
    path('add_element/', views.add_element, name='add_element'),
    path('get_elements/', views.get_elements, name='get_elements'),
    path('get_plan/', views.get_plan, name='get_plan'),
    path('set_plan_paddingX/', views.set_plan_paddingX, name='set_plan_paddingX'),
    path('set_plan_paddingY/', views.set_plan_paddingY, name='set_plan_paddingY'),
    path('set_plan_scale/', views.set_plan_scale, name='set_plan_scale'),
    path('set_element_x/', views.set_element_x, name='set_element_x'),
    path('set_element_y/', views.set_element_y, name='set_element_y'),
    path('add_floor/', views.add_floor, name='add_floor'),
    path('get_floors/', views.get_floors, name='get_floors'),
    path('add_level/', views.add_level, name='add_level'),
    path('set_floor/', views.set_floor, name='set_floor'),
    path('set_plate/', views.set_plate, name='set_plate'),
    path('set_plate_point/', views.set_plate_point, name='set_plate_point'),
    path('add_plate/', views.add_plate, name='add_plate'),
    path('add_plate_point/', views.add_plate_point, name='add_plate_point'),
    path('get_plates/', views.get_plates, name='get_plates'),
    path('get_plate_points/', views.get_plate_points, name='get_plate_points'),
    path('add_aperture/', views.add_aperture, name='add_aperture'),
    path('get_apertures/', views.get_apertures, name='get_apertures'),

]
