
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('personal_information_id')
                ->constrained('personal_information')
                ->restrictOnDelete();

            $table->string('level', 10);
            $table->string('institution_name', 200);
            $table->string('major', 150)->nullable();

            $table->unsignedSmallInteger('start_year');
            $table->unsignedSmallInteger('end_year')->nullable();

            $table->boolean('is_current')->default(false);

            $table->timestamps();

            $table->index([
                'personal_information_id',
                'start_year'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educations');
    }
};
