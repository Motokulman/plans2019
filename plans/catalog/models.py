from django.db import models
from django.urls import reverse


class Plan(models.Model):
    """Model representing a plan"""
    title = models.CharField(max_length=200)
    paddingX = models.IntegerField(null=True, blank=True)
    paddingY = models.IntegerField(null=True, blank=True)
    scale = models.FloatField(null=True, blank=True)

    def __str__(self):
        """String for representing the Plan object."""
        return self.title

    def get_absolute_url(self):
        """Returns the url to access a detail record for this Plan."""
        return reverse('plan-detail', args=[str(self.id)])


class Element(models.Model):
    """Element - it's wall or smth else on the axis. Between axises"""
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    x0 = models.IntegerField()
    y0 = models.IntegerField()
    x1 = models.IntegerField()
    y1 = models.IntegerField()
    wallType = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        """String for representing the Element object."""
        return self.plan

class RoundedElement(models.Model):
    """RoundedElement - it's rounded wall"""
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    x0 = models.IntegerField()
    y0 = models.IntegerField()
    x1 = models.IntegerField()
    y1 = models.IntegerField()
    h = models.IntegerField()  # height of center of circus from line between two points
    convexityAntiClockWise = models.BooleanField()  # true if from x1y1 to x0y0 you need to go by AntiClockWise
    eAntiClockWise = models.BooleanField()  # true if for draw circle you need to go by AntiClockWise
    wallType = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        """String for representing the Element object."""
        return self.plan


class Floor(models.Model):
    """Model representing a floor height"""
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    height = models.IntegerField(null=True, blank=True)  # mm
    batch = models.IntegerField(null=True, blank=True)  # number of batch of floors one above another
    order = models.IntegerField(null=True, blank=True)  # order of floors in the same batch
    levelFromGroundFloor = models.IntegerField(null=True, blank=True)

    def __str__(self):
        """String for representing the Plan object."""
        return self.title


class Level(models.Model): # non using
    """Model representing a levels, calculated from existing floor levels"""
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    # either floor, relatively of which calculates this level...
    floor = models.IntegerField(null=True, blank=True)
    # ...or level, relatively of which calculates this level
    level = models.IntegerField(null=True, blank=True)
    value = models.IntegerField()  # mm

    def __str__(self):
        """String for representing the Plan object."""
        return self.title


class Plate(models.Model):
    """Model representing a whole plate"""
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    floor = models.IntegerField() # which floor is this plate
    plateType = models.CharField(max_length=200, null=True, blank=True) # type of this plate

    def __str__(self):
        """String for representing the Plan object."""
        return self.title

class PlatePoint(models.Model):
    """Model representing a singele plate point"""
    plate = models.ForeignKey('Plate', on_delete=models.CASCADE)
    x = models.IntegerField() 
    y = models.IntegerField() 

    def __str__(self):
        """String for representing the Plan object."""
        return self.title

