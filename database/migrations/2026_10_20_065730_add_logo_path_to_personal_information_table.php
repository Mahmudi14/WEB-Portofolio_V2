
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_information', function (Blueprint $table) {
            $table->string('logo_path', 1024)
                ->nullable()
                ->after('profile_photo');
        });
    }

    public function down(): void
    {
        Schema::table('personal_information', function (Blueprint $table) {
            $table->dropColumn('logo_path');
        });
    }
};
