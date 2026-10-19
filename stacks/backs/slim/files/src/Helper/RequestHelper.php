<?php

namespace App\Helper;

use Psr\Http\Message\ServerRequestInterface as Request;

/**
 * Reads incoming data the same way in every controller.
 */
class RequestHelper
{
    /**
     * Request body as an array, whether the client sent JSON or form fields.
     */
    public static function body(Request $request): array
    {
        $parsed = $request->getParsedBody();
        if (is_array($parsed) && $parsed !== []) {
            return $parsed;
        }

        // JSON sent without a "Content-Type: application/json" header
        $decoded = json_decode((string) $request->getBody(), true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Query string value: /products?page=2 -> query($request, 'page') === '2'
     */
    public static function query(Request $request, string $key, mixed $default = null): mixed
    {
        return $request->getQueryParams()[$key] ?? $default;
    }

    /**
     * Names of the required fields that are missing or empty.
     */
    public static function missing(array $data, array $requiredFields): array
    {
        return array_values(array_filter(
            $requiredFields,
            fn (string $field) => !isset($data[$field]) || $data[$field] === ''
        ));
    }
}
