<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'category',
        'title',
        'description',
        'year',
        'institution_name',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
