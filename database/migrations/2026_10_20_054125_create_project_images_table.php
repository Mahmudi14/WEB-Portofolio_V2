
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_images', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->string('image_path', 1024);

            $table->unsignedTinyInteger('sort_order');

            $table->timestamps();

            $table->unique(
                ['project_id', 'sort_order'],
                'project_images_project_position_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_images');
    }
};
