
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_category_id')
                ->constrained('project_categories')
                ->restrictOnDelete();

            $table->string('title', 200);
            $table->text('description');

            $table->text('technologies')->nullable();

            $table->unsignedInteger('sort_order')
                ->default(0);

            $table->timestamps();

            $table->index([
                'project_category_id',
                'sort_order'
            ], 'projects_category_sort_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
