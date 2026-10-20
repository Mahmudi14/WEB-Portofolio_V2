<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveResearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'summary' => [
                'required',
                'string',
                'max:15000',
            ],

            'year' => [
                'required',
                'integer',
                'between:1900,'.now()->year,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' =>
                'Judul penelitian wajib diisi.',

            'title.max' =>
                'Judul maksimal 255 karakter.',

            'summary.required' =>
                'Ringkasan penelitian wajib diisi.',

            'summary.max' =>
                'Ringkasan maksimal 15.000 karakter.',

            'year.required' =>
                'Tahun penelitian wajib diisi.',

            'year.between' =>
                'Tahun penelitian harus valid dan tidak boleh melebihi tahun sekarang.',
        ];
    }
}
