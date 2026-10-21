<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('researches', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')
                ->default(0);
        });

        // Pertahankan urutan awal:
        // penelitian terbaru ditampilkan lebih dahulu.
        $researches = DB::table('researches')
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->pluck('id');

        foreach ($researches as $index => $id) {
            DB::table('researches')
                ->where('id', $id)
                ->update([
                    'sort_order' => $index + 1,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('researches', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};