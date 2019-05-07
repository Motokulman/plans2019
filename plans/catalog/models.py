from django.db import models
from django.urls import reverse


class Plan(models.Model):
    """Model representing a plan"""
    title = models.CharField(max_length=200)
    #paddingX = models.IntegerField()
    #paddingY = models.IntegerField()
    #scale = models.FloatField()

    def __str__(self):
        """String for representing the Plan object."""
        return self.title

    def get_absolute_url(self):
        """Returns the url to access a detail record for this Plan."""
        return reverse('plan-detail', args=[str(self.id)])


class Element(models.Model):
    """Element - it's wall or smth else on the axis. Between axises"""
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    # axis_id = models.IntegerField()
    x0 = models.IntegerField()
    y0 = models.IntegerField()
    x1 = models.IntegerField()
    y1 = models.IntegerField()
    x2 = models.IntegerField()  # center of circus
    y2 = models.IntegerField()  # center of circus

    def __str__(self):
        """String for representing the Element object."""
        return self.plan

