<?php

declare(strict_types=1);

/**
 * ====================================================================
 * Gifts Kart - High-Performance Built-in PHP Development Server Router
 * Lightning-Fast Static File Streaming & Zero-Lag Asset Caching
 * ====================================================================
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$docRoot = __DIR__;

// 1. If root path "/", serve index.html instantly
if ($uri === '/' || $uri === '') {
    $indexFile = $docRoot . DIRECTORY_SEPARATOR . 'index.html';
    if (file_exists($indexFile)) {
        header('Content-Type: text/html; charset=UTF-8');
        header('Cache-Control: no-cache');
        readfile($indexFile);
        return true;
    }
}

// 2. If the request is for an existing static file, serve it directly with high-performance headers
$filePath = $docRoot . str_replace('/', DIRECTORY_SEPARATOR, $uri);
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
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

    if (in_array($extension, ['css', 'js', 'svg', 'png', 'jpg', 'woff2', 'woff'])) {
        header('Cache-Control: public, max-age=86400');
    }

    readfile($filePath);
    return true;
}

// 3. Forward API requests to PHP REST API Entrypoint
require_once __DIR__ . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'index.php';
