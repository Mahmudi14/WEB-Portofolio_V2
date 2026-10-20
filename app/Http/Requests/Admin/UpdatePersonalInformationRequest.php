<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UpdatePersonalInformationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $whatsapp = $this->input('whatsapp');

        if (! is_string($whatsapp)) {
            return;
        }

        // Hilangkan spasi, tanda +, kurung, dan tanda hubung.
        $number = preg_replace('/[\s()+.-]/', '', $whatsapp);

        // Nomor lokal Indonesia: 08... menjadi 628...
        if (str_starts_with($number, '0')) {
            $number = '62' . substr($number, 1);
        }

        $this->merge([
            'whatsapp' => $number === '' ? null : $number,
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:150'],
            'display_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:255'],

            'whatsapp' => [
                'nullable',
                'string',
                'regex:/^[1-9][0-9]{7,14}$/',
                'max:20',
            ],

            'photo' => [
                'nullable',
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max('3mb'),
            ],

            'logo' => [
                'nullable',
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max('2mb'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'display_name.required' => 'Nama tampilan wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'whatsapp.regex' => 'Nomor WhatsApp tidak valid.',
        ];
    }
}
