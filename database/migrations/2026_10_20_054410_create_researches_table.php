
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('researches', function (Blueprint $table) {
            $table->id();

            $table->string('title', 255);
            $table->text('summary');
            $table->unsignedSmallInteger('year');

            $table->timestamps();

            $table->index('year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('researches');
    }
};
