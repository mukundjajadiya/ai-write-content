import Head from "next/head";
import { useState} from "react";
import bodyParser from "body-parser";
import { promisify } from "util";

const getBody = promisify(bodyParser.urlencoded());

export default function Home({ data }) {
	const [userQuery, setUserQuery] = useState("");

	return (
		<div>
			<Head>
				<title>A.I. Write Content</title>
				<meta
					name="description"
					content="Write blog posts powered by artificial intelligence."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />

				<link rel="icon" href="/icon.png" />
			</Head>

			<div className="container mt-5">
				<form className="container lr-col-8 md-col-10" method="post">
					<div className="mb-3">
						<label htmlFor="user_input1" className="form-label">
							Enter your topic here :
						</label>
						<input
							type="text"
							className="form-control"
							id="user_input1"
							aria-describedby="Enter your topic here."
							value={userQuery}
							name="userquery"
							onChange={(e) => {
								setUserQuery(e.target.value);
							}}
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="user_output" className="form-label">
							Output :
						</label>
						<textarea
							className="form-control"
							id="user_output"
							rows={10}
							name="useroutput"
							value={data}
							onChange={(e) => {
								data = e.target.value;
							}}
						></textarea>
					</div>

					<button type="submit" className="btn btn-primary">
						Submit
					</button>
				</form>
			</div>
		</div>
	);
}

export async function getServerSideProps({ req, res }) {
	if (req.method === "POST") {
		await getBody(req, res);
	}
	const prompt = `${req.body?.userquery}`;
	if (prompt.length === 0 || prompt.trim() === "") {
		return {
			props: { data: "...await for output." },
		};
	}
	if (prompt.trim().length < 10) {
		return {
			props: { data: "Please enter valid topic...." },
		};
	}

	const { Configuration, OpenAIApi } = require("openai");
	console.log(prompt);
	const configuration = new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const completion = await openai.createCompletion("text-davinci-001", {
		prompt: `${prompt}`,
		temperature: 0.5,
		max_tokens: 1000,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
	});

	console.log(completion.data.choices[0].text);
	return {
		props: { data: completion.data.choices[0].text },
	};
}
