<?php

namespace App\Controller;

use App\Core\Route;
use App\Helper\ResponseHelper;
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route(path: '')]
class HomeController extends Controller
{
    #[Route('GET', '/')]
    public function index(): JsonResponse
    {
        return ResponseHelper::success([
            'message' => 'API ready',
            'name' => $_ENV['APP_NAME'] ?? 'API',
            'environment' => $this->getParameter('kernel.environment'),
            'timezone' => date_default_timezone_get(),
            'current_time' => date('Y-m-d H:i:s'),
        ]);
    }
}
