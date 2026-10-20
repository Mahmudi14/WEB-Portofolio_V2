<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveSocialLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'platform' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'url', 'starts_with:https://', 'max:2048'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:4294967295'],
        ];
    }
}
