
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();

            $table->string('category', 20);
            $table->string('position', 150);
            $table->string('institution_name', 200);

            $table->text('description');
            $table->string('logo_path', 1024)->nullable();

            $table->unsignedSmallInteger('start_year');
            $table->unsignedSmallInteger('end_year')->nullable();

            $table->boolean('is_current')->default(false);

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
        Schema::dropIfExists('experiences');
    }
};
