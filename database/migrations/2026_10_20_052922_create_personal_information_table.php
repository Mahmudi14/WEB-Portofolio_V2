
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('personal_information', function (Blueprint $table) {
            $table->id();

            $table->string('full_name', 150);
            $table->string('display_name', 100);
            $table->string('profile_photo', 1024)->nullable();
            $table->string('email', 255);
            $table->string('whatsapp', 20)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_information');
    }
};
