<?php

declare(strict_types=1);

/**
 * ====================================================================
 * Gifts Kart - Master Root Entrypoint & Static / API Bridge
 * Tagline: Create Memories That Last Forever
 * ====================================================================
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$docRoot = __DIR__;

// 1. If API or SEO XML request, forward to PHP REST Engine
if (str_starts_with($uri, '/api/') || $uri === '/sitemap.xml' || $uri === '/robots.txt') {
    require_once $docRoot . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'index.php';
    exit;
}

// 2. If requesting root "/" or "/index.php", stream index.html
if ($uri === '/' || $uri === '' || $uri === '/index.php' || $uri === '/index.html') {
    $indexFile = $docRoot . DIRECTORY_SEPARATOR . 'index.html';
    if (file_exists($indexFile)) {
        header('Content-Type: text/html; charset=UTF-8');
        header('Cache-Control: no-cache, must-revalidate');
        readfile($indexFile);
        exit;
    }
}

// 3. If requesting existing HTML, CSS, JS, SVG, image asset
$filePath = $docRoot . str_replace('/', DIRECTORY_SEPARATOR, $uri);
if (file_exists($filePath) && !is_dir($filePath)) {
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mimeTypes = [
        'html' => 'text/html; charset=UTF-8',
        'css'  => 'text/css; charset=UTF-8',
        'js'   => 'application/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'ico'  => 'image/x-icon',
        'woff2'=> 'font/woff2',
        'woff' => 'font/woff',
        'ttf'  => 'font/ttf',
    ];

    if (isset($mimeTypes[$extension])) {
        header('Content-Type: ' . $mimeTypes[$extension]);
    }
    readfile($filePath);
    exit;
}

// 4. Default fallback to index.html
$indexFile = $docRoot . DIRECTORY_SEPARATOR . 'index.html';
if (file_exists($indexFile)) {
    header('Content-Type: text/html; charset=UTF-8');
    readfile($indexFile);
    exit;
}

require_once $docRoot . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'index.php';
