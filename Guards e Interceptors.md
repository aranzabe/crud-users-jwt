## 1️⃣ Guards

**Qué son:**

* Son clases que implementan la interfaz `CanActivate`.
* Se ejecutan **antes de que el request llegue al controlador**.
* Su propósito principal es **decidir si una solicitud puede continuar o no** (autorización/autenticación).

**Uso típico:**

* Verificar JWT o tokens (`JwtAuthGuard`)
* Revisar roles (`RolesGuard`)
* Bloquear accesos según condiciones personalizadas

**Métodos importantes:**

```ts
canActivate(context: ExecutionContext): boolean | Promise<boolean>
```

* Devuelve `true` → request continúa
* Devuelve `false` → NestJS lanza **403 Forbidden**
* Puede lanzar excepciones (`UnauthorizedException`, etc.)

**Flujo:**

```
Request → Guard → (si true) Controller → Handler
```

**Ejemplo simple:**

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user?.roles.includes('admin');
  }
}
```

---

## 2️⃣ Interceptors

**Qué son:**

* Son clases que implementan la interfaz `NestInterceptor`.
* Se ejecutan **después de que el request llega al controlador**, **pero antes de devolver la respuesta**.
* Se enfocan en **transformar o manipular la respuesta o manejar lógica alrededor del handler**.

**Uso típico:**

* Transformar datos de salida (por ejemplo, formatear respuestas)
* Logging o trazado de tiempos de ejecución
* Manejar caché
* Capturar y transformar errores
* Aplicar “timeout” a solicitudes

**Métodos importantes:**

```ts
intercept(context: ExecutionContext, next: CallHandler): Observable<any>
```

* `next.handle()` devuelve un observable con la respuesta del handler
* Puedes usar operadores RxJS (`map`, `tap`, etc.) para transformar la respuesta o aplicar lógica adicional

**Flujo:**

```
Request → Controller → Handler → Interceptor → Response
```

**Ejemplo simple:**

```ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ status: 'success', data })) // envolver respuesta
    );
  }
}
```

---

## 3️⃣ Diferencias clave

| Aspecto              | Guard                                                    | Interceptor                                                        |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| Propósito            | Autorización/autenticación → permitir o bloquear request | Transformación, logging, métricas, manejo de respuesta             |
| Momento de ejecución | Antes de que el request llegue al handler                | Después del handler, antes de devolver la respuesta                |
| Retorno              | `boolean` o excepción → continua o bloquea               | `Observable` → modifica o envuelve la respuesta                    |
| Se aplica a          | Routes, Controllers, Global                              | Routes, Controllers, Global                                        |
| Ejemplo              | `JwtAuthGuard`, `RolesGuard`                             | `LoggingInterceptor`, `TimeoutInterceptor`, `TransformInterceptor` |

