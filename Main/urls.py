from django.urls import path
from . import views

app_name = "Main"

urlpatterns = [

    path("", views.index),
    path("<str:name>/<int:score>/<str:difficulty>", views.add_player),
    path("leaderboards", views.get_players)
    
]