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
    path('set_element_x/', views.set_element_x, name='set_element_x'),
    path('set_element_y/', views.set_element_y, name='set_element_y'),
]
