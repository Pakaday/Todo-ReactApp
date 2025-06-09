using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace TodoApi.Controllers
{
	public class BaseController : ControllerBase
	{
		protected string GetCurrentUserId() => User.Identity?.Name ?? "";
	}
}
