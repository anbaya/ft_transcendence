from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("assistant", "0002_documentchunk"),
    ]

    operations = [
        migrations.AlterField(
            model_name="aiinteraction",
            name="project_id",
            field=models.BigIntegerField(blank=True, null=True),
        ),
    ]
