<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app = AppFactory::create();

$app->get('/', function (Request $req, Response $res) {
    $payload = [
        'app' => '{{PROJECT_NAME}}',
        'framework' => 'slim',
        'db' => '{{DB}}',
        'message' => 'Hello from Polystack!',
    ];
    $res->getBody()->write(json_encode($payload));
    return $res->withHeader('Content-Type', 'application/json');
});

$app->run();
