from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('add_text/', views.add_text, name='add_text'),
    path('text_list/', views.text_list, name='text_list'),
    path('hashtag_cloud/', views.hashtag_cloud, name='hashtag_cloud'),
]
