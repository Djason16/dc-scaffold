<?php

namespace App\Helper;

/**
 * Real type of a file sent by a visitor, read in its content (finfo): the type given by the browser can be faked
 * (a PHP file named photo.png and sent as image/png). Check it before saving the file, and save it with the
 * extension of its real type, never with the name sent.
 *
 *   $path = $file->getStream()->getMetadata('uri')       Slim (PSR-7 uploaded file)
 *   $path = $_FILES['photo']['tmp_name']                  plain PHP
 *   if (!FileTypeHelper::isImage($path)) return 400       JPEG, PNG, WEBP, GIF or AVIF only
 *   $name = bin2hex(random_bytes(16)) . '.' . FileTypeHelper::extension($path)
 */
class FileTypeHelper
{
    // Real type => extension used to save the file
    public const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/avif' => 'avif',
        'application/pdf' => 'pdf',
    ];

    public const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

    /** Type read in the content of the file ("image/png"...), "" when it cannot be read. */
    public static function of(string $path): string
    {
        return is_file($path) ? (string) (new \finfo(FILEINFO_MIME_TYPE))->file($path) : '';
    }

    public static function isImage(string $path): bool
    {
        return in_array(self::of($path), self::IMAGE_TYPES, true);
    }

    /** Extension of the real type ("png"...), null when the type is not in EXTENSIONS: the file is refused. */
    public static function extension(string $path): ?string
    {
        return self::EXTENSIONS[self::of($path)] ?? null;
    }
}
