# Generated by Django 2.1.4 on 2019-06-17 16:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0025_auto_20190617_1906'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='aperture',
            name='h',
        ),
    ]
