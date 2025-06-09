using Microsoft.EntityFrameworkCore;
using TodoApi.Data;

namespace TodoApi.Tests.Data
{
	public static class TestDbContextFactory
	{
		public static TodoDbContext CreateInMemoryDbContext()
		{
			var options = new DbContextOptionsBuilder<TodoDbContext>()
				.UseInMemoryDatabase(Guid.NewGuid().ToString())
				.Options;

			return new TodoDbContext(options);
		}
	}
}
