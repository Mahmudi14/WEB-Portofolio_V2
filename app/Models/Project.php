<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'project_category_id',
        'title',
        'description',
        'technologies',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            ProjectCategory::class,
            'project_category_id'
        );
    }

    public function images(): HasMany
    {
        return $this->hasMany(
            ProjectImage::class,
            'project_id'
        )->orderBy('sort_order')->orderBy('id');
    }
}
