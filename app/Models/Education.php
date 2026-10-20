<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Education extends Model
{
    // Nama tabel sesuai migration yang sudah ada
    protected $table = 'educations';

    protected $fillable = [
        'personal_information_id',
        'level',
        'institution_name',
        'major',
        'start_year',
        'end_year',
        'is_current',
    ];

    protected function casts(): array
    {
        return [
            'start_year' => 'integer',
            'end_year' => 'integer',
            'is_current' => 'boolean',
        ];
    }

    public function personalInformation(): BelongsTo
    {
        return $this->belongsTo(
            PersonalInformation::class,
            'personal_information_id'
        );
    }
}
