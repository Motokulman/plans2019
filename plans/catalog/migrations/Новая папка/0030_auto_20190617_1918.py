# Generated by Django 2.1.4 on 2019-06-17 16:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0029_auto_20190617_1917'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='aperture',
            name='center',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='filling',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='h',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='l1',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='l2',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='ld',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='maxH',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='maxL',
        ),
        migrations.RemoveField(
            model_name='aperture',
            name='r',
        ),
    ]
