<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAboutSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'description' => [
                'required',
                'string',
                'max:10000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Deskripsi Tentang Saya wajib diisi.',
        ];
    }
}
