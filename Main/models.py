from django.db import models

# Create your models here.
class Player(models.Model):
    name = models.CharField(max_length=150)
    score = models.IntegerField()
    difficulty = models.CharField(max_length=12)

    def __str__(self):
        return "name: " + self.name + ", score: " + str(self.score) + ", difficulty: " + self.difficulty

    