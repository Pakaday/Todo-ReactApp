using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class TodoItem
{
	public long Id
	{
		get;
		set;
	}

	[Required]
	public string Title
	{
		get;
		set;
	}

	public string? Description
	{
		get;
		set;
	}

	public bool IsCompleted
	{
		get;
		set;
	}

	[Required]
	public DateTime DueDate
	{
		get;
		set;
	}

	public string? UserId 
	{ 
		get; 
		set; 
	}
}