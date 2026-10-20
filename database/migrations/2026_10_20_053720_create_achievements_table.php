
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();

            $table->string('category', 20);
            $table->string('title', 200);

            $table->text('description')->nullable();

            $table->unsignedSmallInteger('year');

            $table->string('institution_name', 200)->nullable();

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index([
                'category',
                'sort_order'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
