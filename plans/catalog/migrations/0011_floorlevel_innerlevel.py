# Generated by Django 2.1.4 on 2019-05-27 13:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0010_auto_20190527_1521'),
    ]

    operations = [
        migrations.CreateModel(
            name='FloorLevel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('level', models.IntegerField()),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalog.Plan')),
            ],
        ),
        migrations.CreateModel(
            name='InnerLevel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('level', models.IntegerField()),
                ('floorLevel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalog.FloorLevel')),
            ],
        ),
    ]
