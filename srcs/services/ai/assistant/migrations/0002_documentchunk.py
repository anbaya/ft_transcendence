from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("assistant", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DocumentChunk",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                ("project_id", models.BigIntegerField()),
                ("document_id", models.BigIntegerField()),
                ("content", models.TextField()),
                ("embedding", models.JSONField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
