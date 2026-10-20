<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHeroSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'headline' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'required',
                'string',
                'max:3000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'headline.required' => 'Headline wajib diisi.',
            'description.required' => 'Deskripsi Hero wajib diisi.',
        ];
    }
}
