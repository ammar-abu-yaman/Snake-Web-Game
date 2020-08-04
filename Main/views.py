from django.shortcuts import render
from .models import Player
from django.http import JsonResponse



def index(request):
    template_name =  "Main/index.html"
    return render(request, template_name)

def add_player(request, name, score, difficulty):
    if (request.method == "POST"): 
        res = Player.objects.update_or_create(name=name,defaults={

            'score': score,
            'difficulty':difficulty
            
        })
        


def get_players(request):
    players = Player.objects.all()
    lst = []
    for player in players:
        lst.append({"name":player.name, 'score': player.score, 'difficulty':player.difficulty})

    data = {'players':lst}
    
    return JsonResponse(data, safe=False)
    
