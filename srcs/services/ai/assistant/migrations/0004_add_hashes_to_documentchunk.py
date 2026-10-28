from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("assistant", "0003_alter_aiinteraction_project_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="documentchunk",
            name="content_hash",
            field=models.CharField(blank=True, db_index=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="documentchunk",
            name="doc_hash",
            field=models.CharField(blank=True, db_index=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="documentchunk",
            name="chunk_index",
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="documentchunk",
            name="embedding",
            field=models.JSONField(blank=True, null=True),
        ),
    ]
