using ChefCopilot.Application.Auth.Commands.LoginUser;
using ChefCopilot.Application.Auth.Commands.RegisterUser;
using ChefCopilot.Application.Auth.Common;
using Microsoft.AspNetCore.Mvc;

namespace ChefCopilot.WebApi.Controllers;

public class AuthController : BaseController
{
    // POST api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterUserCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginUserCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }
}
