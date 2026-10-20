
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('skill_category_id')
                ->constrained('skill_categories')
                ->cascadeOnDelete();

            $table->string('name', 120);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->unique(
                ['skill_category_id', 'name'],
                'skill_items_category_name_unique'
            );

            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_items');
    }
};
