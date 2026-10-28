<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">


    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}

    @if (($page['component'] ?? '') === 'welcome')
    <style>
        html,
        body {
            background-color: #0b0d10;
            color: #f4f4f2;
        }
    </style>
    @else
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>
    @endif



    {{-- Dynamic favicon from uploaded website logo --}}
    @php
    $faviconLogo = (($page['component'] ?? '') === 'welcome')
    ? data_get($page, 'props.profile.logo_url')
    : null;
    @endphp

    @if (is_string($faviconLogo) && $faviconLogo !== '')
    <link rel="icon" href="{{ $faviconLogo }}">
    @else
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    @endif

    <link rel="apple-touch-icon" href="/apple-touch-icon.png">


    @fonts


    @viteReactRefresh

    @if (($page['component'] ?? '') === 'welcome')
    @vite([
    'resources/css/app.css',
    'resources/css/landing-entry.css',
    'resources/js/app.tsx',
    "resources/js/pages/{$page['component']}.tsx",
    ])
    @else
    @vite([
    'resources/css/app.css',
    'resources/js/app.tsx',
    "resources/js/pages/{$page['component']}.tsx",
    ])
    @endif

    <x-inertia::head>
        <title>{{ ($page['component'] ?? '') === 'welcome' ? 'Portofolio Mahmudi' : config('app.name', 'Laravel') }}
        </title>
    </x-inertia::head>
</head>

<body class="font-sans antialiased">
    <x-inertia::app />
</body>

</html>