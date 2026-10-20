<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveEducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('major') === '') {
            $this->merge([
                'major' => null,
            ]);
        }

        if ($this->boolean('is_current')) {
            $this->merge([
                'end_year' => null,
            ]);
        }
    }

    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return [
            'level' => [
                'required',
                'string',
                Rule::in([
                    'SD',
                    'SMP',
                    'SMA',
                    'D3',
                    'D4',
                    'S1',
                    'S2',
                    'S3',
                ]),
            ],

            'institution_name' => [
                'required',
                'string',
                'max:200',
            ],

            'major' => [
                'nullable',
                'string',
                'max:150',
            ],

            'start_year' => [
                'required',
                'integer',
                'between:1900,' . $currentYear,
            ],

            'end_year' => [
                'nullable',
                'integer',
                'gte:start_year',
                'max:' . $currentYear,
            ],

            'is_current' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'level.required' =>
                'Jenjang pendidikan wajib dipilih.',

            'level.in' =>
                'Jenjang pendidikan tidak valid.',

            'institution_name.required' =>
                'Nama institusi wajib diisi.',

            'start_year.required' =>
                'Tahun mulai wajib diisi.',

            'start_year.between' =>
                'Tahun mulai tidak valid.',

            'end_year.gte' =>
                'Tahun selesai tidak boleh sebelum tahun mulai.',

            'end_year.max' =>
                'Tahun selesai tidak boleh melebihi tahun sekarang.',
        ];
    }
}
