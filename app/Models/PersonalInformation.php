<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PersonalInformation extends Model
{
    protected $table = 'personal_information';

    protected $fillable = [
        'full_name',
        'display_name',
        'profile_photo',
        'logo_path',
        'email',
        'whatsapp',
    ];

    public function educations(): HasMany
    {
        return $this->hasMany(
            Education::class,
            'personal_information_id'
        )->orderByDesc('start_year')->orderByDesc('id');
    }
}
