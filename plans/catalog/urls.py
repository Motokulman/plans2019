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
]
