<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = [
        'category',
        'position',
        'institution_name',
        'description',
        'logo_path',
        'start_year',
        'end_year',
        'is_current',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_year' => 'integer',
            'end_year' => 'integer',
            'is_current' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
